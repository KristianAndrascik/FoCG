#include "io/obj_loader.h"
#include "triangle.h"
#include <fstream>
#include <sstream>
#include <iostream>

std::vector<std::shared_ptr<hittable>> load_obj(const std::string& filename, std::shared_ptr<Material> mat) {
    std::vector<std::shared_ptr<hittable>> triangles;
    std::vector<point3> temp_vertices;
    std::vector<vec3> temp_normals;
    std::vector<vec3> temp_uvs;

    // Try relative path first
    std::ifstream file(filename);
    if (!file.is_open()) {
        // Try scene/scenes/ folder (if running from root)
        std::string alt_path = "scene/scenes/" + filename;
        file.open(alt_path);
        if (!file.is_open()) {
            // Try ../scene/scenes/ folder (if running from build)
            std::string alt_path_build = "../scene/scenes/" + filename;
            file.open(alt_path_build);
            if (!file.is_open()) {
                // Try ../../scene/scenes/ folder (if running from build/Debug)
                std::string alt_path2 = "../../scene/scenes/" + filename;
                file.open(alt_path2);
                if (!file.is_open()) {
                    std::cerr << "Failed to open OBJ file: " << filename << std::endl;
                    return triangles;
                }
            }
        }
    }

    std::string line;
    while (std::getline(file, line)) {
        if (line.substr(0, 2) == "v ") {
            std::stringstream ss(line.substr(2));
            double x, y, z;
            ss >> x >> y >> z;
            temp_vertices.emplace_back(x, y, z);
        }
        else if (line.substr(0, 3) == "vn ") {
            std::stringstream ss(line.substr(3));
            double x, y, z;
            ss >> x >> y >> z;
            temp_normals.emplace_back(x, y, z);
        }
        else if (line.substr(0, 3) == "vt ") {
            std::stringstream ss(line.substr(3));
            double u, v;
            ss >> u >> v;
            temp_uvs.emplace_back(u, v, 0);
        }
        else if (line.substr(0, 2) == "f ") {
            std::string vertex_defs;
            vertex_defs = line.substr(2);
            std::stringstream ss(vertex_defs);
            std::string segment;
            
            struct VertexIdx { int v, vt, vn; };
            std::vector<VertexIdx> face_indices;

            while (ss >> segment) {
                VertexIdx idx = {0, 0, 0};
                size_t first_slash = segment.find('/');
                size_t second_slash = segment.find('/', first_slash + 1);

                if (first_slash == std::string::npos) {
                    idx.v = std::stoi(segment);
                } else {
                    idx.v = std::stoi(segment.substr(0, first_slash));
                    if (second_slash != std::string::npos) {
                        // v/vt/vn or v//vn
                        if (second_slash > first_slash + 1) {
                             idx.vt = std::stoi(segment.substr(first_slash + 1, second_slash - first_slash - 1));
                        }
                        idx.vn = std::stoi(segment.substr(second_slash + 1));
                    } else {
                        // v/vt
                         auto vt_str = segment.substr(first_slash + 1);
                         if (!vt_str.empty()) idx.vt = std::stoi(vt_str);
                    }
                }
                face_indices.push_back(idx);
            }

            // Triangulate fan
            for (size_t i = 1; i < face_indices.size() - 1; ++i) {
                VertexIdx i0 = face_indices[0];
                VertexIdx i1 = face_indices[i];
                VertexIdx i2 = face_indices[i+1];
                
                auto get_v = [&](int idx) { return temp_vertices[idx-1]; };
                auto get_n = [&](int idx) { return temp_normals[idx-1]; };
                auto get_uv = [&](int idx) { return temp_uvs[idx-1]; };

                if (i0.vn != 0 && i1.vn != 0 && i2.vn != 0) {
                    if (i0.vt != 0 && i1.vt != 0 && i2.vt != 0) {
                        triangles.push_back(std::make_shared<triangle>(
                            get_v(i0.v), get_v(i1.v), get_v(i2.v),
                            get_n(i0.vn), get_n(i1.vn), get_n(i2.vn),
                            get_uv(i0.vt), get_uv(i1.vt), get_uv(i2.vt),
                            mat
                        ));
                    } else {
                        triangles.push_back(std::make_shared<triangle>(
                            get_v(i0.v), get_v(i1.v), get_v(i2.v),
                            get_n(i0.vn), get_n(i1.vn), get_n(i2.vn),
                            mat
                        ));
                    }
                } else {
                     triangles.push_back(std::make_shared<triangle>(
                        get_v(i0.v), get_v(i1.v), get_v(i2.v),
                        mat
                    ));
                }
            }
        }
    }
    std::cout << "Loaded " << triangles.size() << " triangles from " << filename << std::endl;
    return triangles;
}
