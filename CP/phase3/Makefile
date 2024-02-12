SHELL = /bin/sh
BIN_NAME = MD

CXX = nvcc
LD = nvcc

CXXFLAGS = -O3 -g -std=c++11 -arch=sm_35 -Wno-deprecated-gpu-targets #-Ofast -mavx -ftree-vectorize

SRC_DIR = src
BIN_DIR = bin
BUILD_DIR = build
SRC = $(wildcard $(SRC_DIR)/MD.cu)
OBJ = $(patsubst src/%.cu,build/%.o,$(SRC))
BIN = $(BIN_NAME)

vpath %.cu $(SRC_DIR)

################################################################################
# Rules
################################################################################

.DEFAULT_GOAL = all

$(BUILD_DIR)/%.o: %.cu
    module load gcc/7.2.0;\
    module load cuda/11.3.1;\
    $(CXX) -c $(CXXFLAGS) $(INCLUDES) $< -o $@ $(LIBS)

$(BIN_DIR)/$(BIN_NAME): $(OBJ)
    module load gcc/7.2.0;\
    module load cuda/11.3.1;\
    $(CXX) $(CXXFLAGS) $(INCLUDES) -o $@ $(OBJ) $(LIBS)

checkdirs:
    @mkdir -p $(BUILD_DIR)
    @mkdir -p $(BIN_DIR)

all: checkdirs $(BIN_DIR)/$(BIN_NAME)

clean:
    rm -f $(BUILD_DIR)/* $(BIN_DIR)/* 

run:
    sbatch run.sh
