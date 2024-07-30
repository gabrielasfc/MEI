const Sala = require('../models/sala')

async function validateSubmission(dados) {
    const mandatory_fields = ["building", "floor", "room", "capacity"]

    // Verificação do ficheiro .JSON
    var reg_is_single = false
    var lista = Array.isArray(dados) ? lista = dados : (reg_is_single = true, lista = [dados])

    // Verifica se tem conteudo
    if(lista.length == 0) {
        throw ({ "ERRO": "Ficheiro sem registos!" })
    }

    var n_registo = 1
    for(let registo of lista){
        var all_fields = Object.keys(registo)

        // Obrigação de ter os seguintes campos
        var has_mandatory = true
        for (var i = 0; has_mandatory && i < mandatory_fields.length; i++) {
            m_field = mandatory_fields[i]
            has_mandatory = all_fields.includes(m_field)
            if (!has_mandatory) {
                throw ({ "ERRO": `Encontrados registos sem o campo obrigatório "${m_field}".` + (reg_is_single ? "" : ` Encontrado no registo nº${n_registo}.`), "registo": registo })
            }
        }
        n_registo++
    }
    return { "message": `Inseridos ${lista.length} novos registos com sucesso.` }
}

function setupSala(salas){
    const mandatory_fields = ["building", "floor", "room", "capacity"]
    let res = []

    for(let sala of salas){
        let filteredKeys = Object.keys(sala).filter(key => mandatory_fields.includes(key));
        let newSala = {};
        filteredKeys.forEach(key => {
          newSala[key] = sala[key];
        });
        newSala['allocations'] = []
        res.push(newSala)
    }
    return res
}

// Devolve todas as Salas
module.exports.list = () => {
    return Sala.find()
            .then((result) => {
                return result
            }).catch((err) => {
                throw err
            });
}

// Adiciona várias salas e verifica se contém a informação necessária
module.exports.addSalas = async (s) => {
    try {
        await validateSubmission(s);
        s = setupSala(s);
        if (Array.isArray(s)) {
            return await Sala.insertMany(s, { rawResult: true });
        } else {
            return await Sala.collection.insertOne(s);
        }
    } catch (error) {
        throw error;
    }
};

// Remove uma sala e devolve uma sala disponivel para repor as suas alocações
module.exports.deleteSala = async (id) => {
    try {
        const allSalas = await Sala.find();
        
        if (!allSalas || allSalas.length === 0) {
            throw ({"Erro": "Não existem salas"});
        }

        const salaToDelete = await Sala.findById(id);

        if (!salaToDelete) {
            throw ({"Erro": "A sala deseja eliminar não existe"});
        }

        const allocations = salaToDelete.allocations;

        let returnSala = null;
        let available = true;

        for (const s of allSalas) {
            available = true;

            for (const aloc of allocations) {
                const startTime = aloc.startTime;
                const endTime = aloc.endTime;

                for (const a of s.allocations) {
                    if (!checkAvailability(startTime, endTime, a.startTime, a.endTime)) {
                        available = false;
                        break;
                    }
                }

                if (!available) {
                    break;
                }
            }

            if (available) {
                returnSala = s;
                break;
            }
        }
        if(returnSala === null){
            throw({"Erro": "A sala deseja eliminar não pode ser eliminada porque não existem salas capazes de a substituir."});
        }

        await Sala.deleteOne({_id: id});

        return {"sala": returnSala, "allocations": allocations};
    } catch (err) {
        throw err;
    }
};


// Retorna toda a info acerca de várias salas
module.exports.getSala = (ids) => {
    return Sala.find({_id: {$in: ids}})
            .then((result) => {
                return result
            }).catch((err) => {
                throw err
            });
}

// Aloca sala (UNUSED)
module.exports.allocateSala = (aloc) => {
    return Sala.updateOne(
        { _id: id },
        { $push: { allocations: {
            "startTime": aloc.startTime,
            "endTime": aloc.endTime,
        } } }
     )
}

// Aloca salas (Não tem bem noção de TRANSACTION)
module.exports.allocateSalas = async (alocs) => {
    let modified = 0
    for (let aloc of alocs) {
        st = new Date(aloc.startTime)
        et = new Date(aloc.endTime)

        if(st<et){
            output = await Sala.updateOne(
                { _id: aloc.id },
                { $push: { allocations: {
                    "startTime": aloc.startTime,
                    "endTime": aloc.endTime,
                } } }
             )
            // console.log(output)
            // Talvez fosse melhor outro if aqui (mas funciona)
            if (output.modifiedCount == 0) {
                throw ({ "ERRO": `Sala com id ${aloc.id} não existe.` })
            }
            modified+=1
        }
    }
    return { "message": `Alocadas ${modified} salas com sucesso.` }
}

function checkAvailability(st, et, allocationST, allocationET){
    // Verifica se o horário a alocar está "dentro" de um horário já alocado
    if(st >= allocationST && st <= allocationET || et >= allocationST && et <= allocationET){
        return false
    }

    // Verifica se o horário já alocado está "dentro" do horário a alocar
    if(allocationST >= st && allocationST <= et || allocationET >= st && allocationET <= et){
        return false
    }

    return true
}

// Obtém as salas que estão disponiveis
module.exports.getSalasAvailable = (startTime, endTime) => {
    try{
        st = new Date(startTime)
        et = new Date(endTime)
    
        if(st>et){
            throw `StartTime precisa de ser menor do que o endTime`
        }
    
        return Sala.find()
                .then((salas) => {
                    let availableSalas = []
    
                    for(let sala of salas){
                        let available = true
                        let allocations = sala.allocations
    
                        for(let allocation of allocations){
                            let allocationST = allocation.startTime
                            let allocationET = allocation.endTime
    
                            available = checkAvailability(st, et, allocationST, allocationET)
                            if(!available){
                                break
                            }
                        }
    
                        if(available){
                            availableSalas.push(sala)
                        }
                    }
                    return availableSalas
                }).catch((err) => {
                    throw err
                });
    } catch(err){
        throw err
    }
}

