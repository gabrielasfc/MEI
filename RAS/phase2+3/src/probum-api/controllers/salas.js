const axios = require('axios');
const env = require('../config/env')


module.exports.getSalasAvailable = (startTime, endTime, numAlunos) => {
    return axios.get(env.salasRoute(`/salas/getSalasAvailable?startTime=${startTime}&endTime=${endTime}`))
        .then((result) => {
			let totalAlunos = 0
			for(sala of result.data){
				totalAlunos += sala.capacity
			}
			if(numAlunos > totalAlunos){
				throw {"Error": "Capacidade insuficiente nas salas disponíveis."}
			}
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.addSalas = (body) => {
    return axios.post(env.salasRoute('/salas'), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.deleteSala = async (id_sala) => {
    // return axios.delete(env.salasRoute(`/salas?id=${id_sala}`))
    //     .then((result) => {
    //         return result
    //     }).catch((err) => {
    //         throw err
    //     });
    try{
        const docentes = await axios.get(env.provasRoute(`/salas/${id_sala}/docentes`))

        if (isNullOrUndefined(docentes)) {
            throw new Error(`${docentes} is null or undefined`);
        }

        const idDocentes = docentes.data.map(item => item.numMecs)
        const docentesString = idDocentes.join(',')
        const encodedIds = encodeURIComponent(docentesString);
        const docentesInfo = await axios.get(env.utilizadoresRoute(`/utilizadores/numMecs?numMecs=${encodedIds}`))

        const receiverList = [];
        const bodySubset = docentesInfo.data.map(item => {
        return {
            name: item.name,
            email: item.email
        };
        });
        bodySubset.forEach(element => receiverList.push(element));
        const data = {
        "receiverList": receiverList,
        "email": {
            "subject": `PROBUM: A seguinte sala foi removida ${id_sala}!`,
            "body": "Pode consultar os testes realizados nessa sala para ver a sala que a substituiu!"
        }
        };

        // Obter e notificar os docentes
        try {
            await axios.post(env.notificacoesRoute('/notificacoes/sendEmail'), data);
          } catch(err) {
            throw ({"Message": "Não foi possivel notificar os docentes da alteração das salas", "Error": err})
          }

        const deleteSala = await axios.delete(env.salasRoute(`/salas?id=${id_sala}`))
        
        const {sala, allocations} = deleteSala.data

        if (isNullOrUndefined(sala) || isNullOrUndefined(allocations)) {
            throw new Error(`${sala} or ${allocations} is null or undefined`);
        }

        try{
            await axios.put(env.provasRoute(`/salas`), {"idSala": id_sala, "idNovaSala": sala._id})
        }
        catch(err) {
            throw ({"Message": "Não foi possivel alterar a sala das provas", "Error": err})
        }


        const body = []
        for(aloc of allocations){
            body.push({
                "id": sala._id,
                "startTime": aloc.startTime,
                "endTime": aloc.endTime
            })
        }

        try{
            await axios.put(env.salasRoute(`/salas/allocateSala`), body)
        } 
        catch(err) {
            throw ({"Message": "Não foi possivel alocar a sala de substituição", "Error": err})
        }

        return {"Sucesso": "Sala removida com sucesso!"}

    }
    catch (err) {
        throw err
    }
}

module.exports.allocateSala = (body) => {
    return axios.put(env.salasRoute(`/salas/allocateSala`), body)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}