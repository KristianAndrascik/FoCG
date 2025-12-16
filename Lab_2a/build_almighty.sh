#!/bin/bash

# Stop the script if any command fails
set -e

echo "=========================================="
echo "   Building for Almighty (Linux/GCC)"
echo "=========================================="

# 1. Clean old build artifacts (Important for the server!)
#    We remove the 'build' folder to ensure no cached configuration remains.
rm -rf build
mkdir build
cd build

# 2. Configure using CMake
#    On the server, this uses the default generator (Makefiles).
cmake ..

# 3. Compile
#    '--build .' is a universal command that calls 'make' on Linux
cmake --build .

echo "=========================================="
echo "   Running Ray Tracer"
echo "=========================================="

# 4. Run the executable and redirect output
#    Note: './raytracer' must match the name in your CMakeLists.txt
./raytracer > ../image.ppm

echo "[SUCCESS] Image generated at image.ppm"