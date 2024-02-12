#include <stdio.h>
#include <cstdlib>
#include <iostream>
#include <sys/time.h>
#include <cuda.h>
#include <chrono>

cudaEvent_t start, stop;

using namespace std;

void checkCUDAError (const char *msg) {
    cudaError_t err = cudaGetLastError();
    if( cudaSuccess != err) {
        cerr << "Cuda error: " << msg << ", " << cudaGetErrorString( err) << endl;
        exit(-1);
    }
}

// These are specific to measure the execution of only the kernel execution - might be useful
void startKernelTime (void) {
    cudaEventCreate(&start);
    cudaEventCreate(&stop);

    cudaEventRecord(start);
}

void stopKernelTime (void) {
    cudaEventRecord(stop);

    cudaEventSynchronize(stop);
    float milliseconds = 0;
    cudaEventElapsedTime(&milliseconds, start, stop);

    cout << endl << "Basic profiling: " << milliseconds << " ms have elapsed for the kernel execution" << endl << endl;
}