#!/bin/bash
#SBATCH --time=1:00
#SBATCH --partition=cpar
#SBATCH --constraint=k20
#SBATCH -W

module load gcc/7.2.0
module load cuda/11.3.1


time ./bin/MD < inputdata.txt
