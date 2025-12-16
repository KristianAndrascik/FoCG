# 1. Strict Version Requirement
# We set this to 3.10 exactly to match the server.
# If you use features from 3.11+, this line will warn you locally.
cmake_minimum_required(VERSION 3.10)

# 2. Project Name
project(RayTracer-Lab2a)

# 3. C++ Standard
# GCC 7.5 supports C++17, which is great for modern math.
# We require it so the compiler doesn't default to an old version (like C++98).
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# 4. Optimization Flags (Optional but recommended for Ray Tracing)
# This makes the renderer run faster on Linux/GCC.
if(NOT MSVC)
    add_compile_options(-O3)
endif()

# 5. Define the Executable
# As you add files (vec3.h, sphere.h), you usually don't need to list headers here,
# just the .cpp files. For now, it's just main.cpp.
add_executable(raytracer main.cpp)