#!/bin/bash

# Stop on any error
set -e

echo "=========================================="
echo "   SYSTEM DIAGNOSTICS"
echo "=========================================="

# 1. Print the current directory
echo "Work Dir: $(pwd)"

# 2. Check CMake Version
#    This verifies if 'cmake' is actually 3.10+
echo -n "CMake:    "
cmake --version | head -n 1

# 3. Check GCC/G++ Version
#    This verifies which compiler CMake will likely find
echo -n "Compiler: "
g++ --version | head -n 1

echo "=========================================="
echo "   BUILD START"
echo "=========================================="

# 4. Clean and Create Build Directory
rm -rf build
mkdir build
cd build

# 5. Configure
#    We explicitly tell CMake to use g++ just in case the server 
#    defaults to an ancient 'cc' compiler.
cmake -DCMAKE_CXX_COMPILER=g++ ..

# 6. Compile
cmake --build .

echo "=========================================="
echo "   RUNNING & SAVING"
echo "=========================================="

# 7. Run
./raytracer 
