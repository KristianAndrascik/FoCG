cmake_minimum_required(VERSION 3.10)


project(RayTracer-Lab2a)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)


include_directories(include)
include_directories(external)
include_directories(external/tinyxml2)

set(SOURCES
    src/main.cpp
    src/io/image_saver.cpp 
    src/io/scene_parser.cpp
    src/io/file_dialog.cpp
    src/io/obj_loader.cpp
    src/stb_impl.cpp
    external/tinyxml2/tinyxml2.cpp
)


add_executable(raytracer ${SOURCES})
