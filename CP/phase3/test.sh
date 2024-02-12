#!/bin/bash

module load gcc/7.2.0
module load cuda/11.3.1

file_path="src/MD.cu"

cp $file_path "${file_path}.bak"

values=(1000 5000 10000 15000 20000 25000 30000 35000 40000 45000 50000)
threads_per_block=(128)
repetitions=3

echo "Iteration Count;Number of Atoms;Threads Per Block;Real Time; User Time; Sys Time" >  results.csv

for n in "${values[@]}"; do
    for t in "${threads_per_block[@]}"; do
        echo "Running arguments: N=$n , THREADS_PER_BLOCK=$t"

        make clean

        sed -i "s/const int N=.*/const int N=$n;/" $file_path
        sed -i "s/#define NUM_THREADS_PER_BLOCK .*/#define NUM_THREADS_PER_BLOCK $t/" $file_path

        make

        for ((i=1; i<=repetitions; i++)); do
            echo "Running iteration $i"
            
            make run
            
            mv slurm*.out temp.txt

            real=$(tail -n 3 temp.txt | head -n 1 | awk '{print $2}' | sed -E 's/([0-9]+)m([0-9]+\.[0-9]+)s/\1\2/')
            user=$(tail -n 2 temp.txt | head -n 1 | awk '{print $2}' | sed -E 's/([0-9]+)m([0-9]+\.[0-9]+)s/\1\2/')
            sys=$(tail -n 1 temp.txt | head -n 1 | awk '{print $2}' | sed -E 's/([0-9]+)m([0-9]+\.[0-9]+)s/\1\2/')
            
            echo "$i;$n;$t;$real;$user;$sys" >> results.csv

            rm temp.txt
        done
    done
done

mv "${file_path}.bak" $file_path

