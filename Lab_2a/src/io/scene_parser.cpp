#include "io/scene_parser.h"
#include "tinyxml2.h"
#include "sphere.h"
#include "triangle.h"
#include "mesh.h"
#include "material.h"
#include "io/obj_loader.h"
#include "stb_image.h"
#include <iostream>
#include <cmath>

using namespace tinyxml2;

// Helper to rotate vector (Forward)
// axis: 0=x, 1=y, 2=z
void rotate_vec_forward(vec3& p, int axis, double deg) {
    if (std::abs(deg) < 1e-6) return;
    double rad = deg * 3.14159265359 / 180.0;
    
    double c = std::cos(rad);
    double s = std::sin(rad);
    double p0 = p[0], p1 = p[1], p2 = p[2];
    if (axis == 0) { // X
        p[1] = p1 * c - p2 * s;
        p[2] = p1 * s + p2 * c;
    } else if (axis == 1) { // Y
        p[0] = p0 * c + p2 * s;
        p[2] = -p0 * s + p2 * c;
    } else if (axis == 2) { // Z
        p[0] = p0 * c - p1 * s;
        p[1] = p0 * s + p1 * c;
    }
}

std::shared_ptr<Material> parse_material(XMLElement* surf) {
    auto mat = std::make_shared<Material>();
    XMLElement* mat_node = surf->FirstChildElement("material_solid");
    if (!mat_node) mat_node = surf->FirstChildElement("material_textured");
    
    if (mat_node) {
        XMLElement* col = mat_node->FirstChildElement("color");
        if (col) {
            col->QueryDoubleAttribute("r", &mat->diffuse[0]);
            col->QueryDoubleAttribute("g", &mat->diffuse[1]);
            col->QueryDoubleAttribute("b", &mat->diffuse[2]);
        }
        
        XMLElement* tex = mat_node->FirstChildElement("texture");
        if (tex) {
            const char* name = tex->Attribute("name");
            if (name) {
                // Try to load texture
                std::string filename = name;
                // Try relative path or scene/scenes
                int w, h, c;
                unsigned char* data = stbi_load(filename.c_str(), &w, &h, &c, 3); // force 3 channels
                if (!data) {
                    std::string alt = "scene/scenes/" + filename;
                    data = stbi_load(alt.c_str(), &w, &h, &c, 3);
                }
                if (!data) {
                    std::string alt2 = "../../scene/scenes/" + filename;
                    data = stbi_load(alt2.c_str(), &w, &h, &c, 3);
                }
                
                if (data) {
                    mat->texture = std::make_shared<Texture>(w, h, 3, data);
                    std::cout << "Loaded texture: " << name << " (" << w << "x" << h << ")" << std::endl;
                } else {
                    std::cerr << "Failed to load texture: " << name << std::endl;
                }
            }
        }

        XMLElement* phong = mat_node->FirstChildElement("phong");
        if (phong) {
            phong->QueryDoubleAttribute("ka", &mat->ka);
            phong->QueryDoubleAttribute("kd", &mat->kd);
            phong->QueryDoubleAttribute("ks", &mat->ks);
            phong->QueryDoubleAttribute("exponent", &mat->exponent);
        }
        XMLElement* refl = mat_node->FirstChildElement("reflectance");
        if (refl) refl->QueryDoubleAttribute("r", &mat->reflectance);
        
        XMLElement* trans = mat_node->FirstChildElement("transmittance");
        if (trans) trans->QueryDoubleAttribute("t", &mat->transmittance);
        
        XMLElement* refrac = mat_node->FirstChildElement("refraction");
        if (refrac) refrac->QueryDoubleAttribute("iof", &mat->iof);
    }
    return mat;
}

void parse_transform(XMLElement* surf, vec3& translate, vec3& rotate, vec3& scale) {
    XMLElement* trans_node = surf->FirstChildElement("transform");
    if (trans_node) {
        XMLElement* t_node = trans_node->FirstChildElement("translate");
        if (t_node) {
            t_node->QueryDoubleAttribute("x", &translate[0]);
            t_node->QueryDoubleAttribute("y", &translate[1]);
            t_node->QueryDoubleAttribute("z", &translate[2]);
        }
        XMLElement* s_node = trans_node->FirstChildElement("scale");
        if (s_node) {
            s_node->QueryDoubleAttribute("x", &scale[0]);
            s_node->QueryDoubleAttribute("y", &scale[1]);
            s_node->QueryDoubleAttribute("z", &scale[2]);
        }
        XMLElement* rx_node = trans_node->FirstChildElement("rotateX");
        if (rx_node) rx_node->QueryDoubleAttribute("theta", &rotate[0]);
        
        XMLElement* ry_node = trans_node->FirstChildElement("rotateY");
        if (ry_node) ry_node->QueryDoubleAttribute("theta", &rotate[1]);
        
        XMLElement* rz_node = trans_node->FirstChildElement("rotateZ");
        if (rz_node) rz_node->QueryDoubleAttribute("theta", &rotate[2]);
    }
}

bool SceneParser::parse(const std::string& filename, camera& cam, hittable_list& world, std::vector<Light>& lights, color& background) {
    XMLDocument doc;
    if (doc.LoadFile(filename.c_str()) != XML_SUCCESS) {
        std::cerr << "Error loading file: " << filename << std::endl;
        std::cerr << "TinyXML2 Error: " << doc.ErrorName() << std::endl;
        // Try printing CWD
        // std::filesystem::current_path() requires C++17 and include <filesystem>
        return false;
    }

    XMLElement* root = doc.FirstChildElement("scene");
    if (!root) {
        std::cerr << "No <scene> element found in " << filename << std::endl;
        return false;
    }

    // Parse output file name from attribute
    const char* output_file = root->Attribute("output_file");
    if (output_file) cam.output_file = output_file;

    // Background color
    XMLElement* bg = root->FirstChildElement("background_color");
    if (bg) {
        bg->QueryDoubleAttribute("r", &background[0]);
        bg->QueryDoubleAttribute("g", &background[1]);
        bg->QueryDoubleAttribute("b", &background[2]);
    }

    // Camera
    XMLElement* cam_el = root->FirstChildElement("camera");
    if (cam_el) {
        XMLElement* pos = cam_el->FirstChildElement("position");
        if (pos) {
            pos->QueryDoubleAttribute("x", &cam.position[0]);
            pos->QueryDoubleAttribute("y", &cam.position[1]);
            pos->QueryDoubleAttribute("z", &cam.position[2]);
        }
        XMLElement* look = cam_el->FirstChildElement("lookat");
        if (look) {
            look->QueryDoubleAttribute("x", &cam.lookat[0]);
            look->QueryDoubleAttribute("y", &cam.lookat[1]);
            look->QueryDoubleAttribute("z", &cam.lookat[2]);
        }
        XMLElement* up = cam_el->FirstChildElement("up");
        if (up) {
            up->QueryDoubleAttribute("x", &cam.up[0]);
            up->QueryDoubleAttribute("y", &cam.up[1]);
            up->QueryDoubleAttribute("z", &cam.up[2]);
        }
        XMLElement* fov = cam_el->FirstChildElement("horizontal_fov");
        if (fov) fov->QueryDoubleAttribute("angle", &cam.horizontal_fov);
        
        XMLElement* res = cam_el->FirstChildElement("resolution");
        if (res) {
            res->QueryIntAttribute("horizontal", &cam.width);
            res->QueryIntAttribute("vertical", &cam.height);
        }

        XMLElement* max_b = cam_el->FirstChildElement("max_bounces");
        if (max_b) max_b->QueryIntAttribute("n", &cam.max_bounces);
        
        // Handle optional camera transform (T7)
        vec3 translate(0,0,0);
        vec3 rotate(0,0,0);
        vec3 scale(1,1,1);
        parse_transform(cam_el, translate, rotate, scale);
        
        // Apply rotation around origin, then translation
        if (rotate[0]!=0 || rotate[1]!=0 || rotate[2]!=0) {
              auto rot_p = [&](vec3& p) {
                  rotate_vec_forward(p, 0, rotate[0]);
                  rotate_vec_forward(p, 1, rotate[1]);
                  rotate_vec_forward(p, 2, rotate[2]);
              };
              rot_p(cam.position);
              rot_p(cam.lookat);
              rot_p(cam.up);
        }
        cam.position += translate;
        cam.lookat += translate;
    }

    // Lights
    XMLElement* lights_el = root->FirstChildElement("lights");
    if (lights_el) {
        for (XMLElement* l_node = lights_el->FirstChildElement(); l_node; l_node = l_node->NextSiblingElement()) {
             std::string name = l_node->Name();
             Light l;
             // Default color
             l.light_color = color(1,1,1);
             // Default values init
             l.position = point3(0,0,0);
             l.direction = vec3(0,0,-1);
             l.spot_alpha1 = 0;
             l.spot_alpha2 = 0;

             if (name == "ambient_light") {
                 l.type = AMBIENT;
                 XMLElement* col = l_node->FirstChildElement("color");
                 if (col) {
                     col->QueryDoubleAttribute("r", &l.light_color[0]);
                     col->QueryDoubleAttribute("g", &l.light_color[1]);
                     col->QueryDoubleAttribute("b", &l.light_color[2]);
                 }
                 lights.push_back(l);
             } else if (name == "parallel_light") {
                 l.type = PARALLEL;
                 XMLElement* col = l_node->FirstChildElement("color");
                 if (col) {
                     col->QueryDoubleAttribute("r", &l.light_color[0]);
                     col->QueryDoubleAttribute("g", &l.light_color[1]);
                     col->QueryDoubleAttribute("b", &l.light_color[2]);
                 }
                 XMLElement* dir = l_node->FirstChildElement("direction");
                 if (dir) {
                     dir->QueryDoubleAttribute("x", &l.direction[0]);
                     dir->QueryDoubleAttribute("y", &l.direction[1]);
                     dir->QueryDoubleAttribute("z", &l.direction[2]);
                 }
                 lights.push_back(l);
             } else if(name == "point_light") {
                 l.type = POINT;
                 XMLElement* col = l_node->FirstChildElement("color");
                 if (col) {
                     col->QueryDoubleAttribute("r", &l.light_color[0]);
                     col->QueryDoubleAttribute("g", &l.light_color[1]);
                     col->QueryDoubleAttribute("b", &l.light_color[2]);
                 }
                 XMLElement* pos = l_node->FirstChildElement("position");
                 if (pos) {
                     pos->QueryDoubleAttribute("x", &l.position[0]);
                     pos->QueryDoubleAttribute("y", &l.position[1]);
                     pos->QueryDoubleAttribute("z", &l.position[2]);
                 }
                 lights.push_back(l);
             } else if (name == "spot_light") {
                 l.type = SPOT;
                 XMLElement* col = l_node->FirstChildElement("color");
                 if (col) {
                     col->QueryDoubleAttribute("r", &l.light_color[0]);
                     col->QueryDoubleAttribute("g", &l.light_color[1]);
                     col->QueryDoubleAttribute("b", &l.light_color[2]);
                 }
                 XMLElement* pos = l_node->FirstChildElement("position");
                 if (pos) {
                     pos->QueryDoubleAttribute("x", &l.position[0]);
                     pos->QueryDoubleAttribute("y", &l.position[1]);
                     pos->QueryDoubleAttribute("z", &l.position[2]);
                 }
                 XMLElement* dir = l_node->FirstChildElement("direction");
                 if (dir) {
                     dir->QueryDoubleAttribute("x", &l.direction[0]);
                     dir->QueryDoubleAttribute("y", &l.direction[1]);
                     dir->QueryDoubleAttribute("z", &l.direction[2]);
                 }
                 XMLElement* falloff = l_node->FirstChildElement("falloff");
                 if (falloff) {
                     falloff->QueryDoubleAttribute("alpha1", &l.spot_alpha1);
                     falloff->QueryDoubleAttribute("alpha2", &l.spot_alpha2);
                 }
                 lights.push_back(l);
             }
        }
    }

    // Surfaces
    XMLElement* surfaces = root->FirstChildElement("surfaces");
    if (surfaces) {
        for (XMLElement* surf = surfaces->FirstChildElement(); surf; surf = surf->NextSiblingElement()) {
             std::string name = surf->Name();
             
             // Common Props
             vec3 translate(0,0,0);
             vec3 rotate(0,0,0);
             vec3 scale(1,1,1);
             parse_transform(surf, translate, rotate, scale);

             if (name == "sphere") {
                 double radius = 0;
                 surf->QueryDoubleAttribute("radius", &radius);
                 
                 vec3 center;
                 XMLElement* pos = surf->FirstChildElement("position");
                 if (pos) {
                     pos->QueryDoubleAttribute("x", &center[0]);
                     pos->QueryDoubleAttribute("y", &center[1]);
                     pos->QueryDoubleAttribute("z", &center[2]);
                 }
                 
                 auto mat = parse_material(surf);
                 
                 // Note: sphere handles transforms internally via Inverse Transform in intersection
                 world.add(std::make_shared<sphere>(center, radius, mat, translate, rotate, scale));
             }
             else if (name == "mesh") {
                 const char* obj_name = surf->Attribute("name");
                 if (obj_name) {
                     auto mat = parse_material(surf);
                     auto mesh_triangles = load_obj(obj_name, mat);
                     
                    
                     
                     for (auto& hptr : mesh_triangles) {
                         auto tri = std::dynamic_pointer_cast<triangle>(hptr);
                         if (tri) {
                             // Lambda to transform point
                             auto transform_p = [&](vec3& p) {
                                  // Scale
                                  p.v[0] *= scale.v[0]; p.v[1] *= scale.v[1]; p.v[2] *= scale.v[2];
                                  // Rotate
                                  rotate_vec_forward(p, 0, rotate[0]);
                                  rotate_vec_forward(p, 1, rotate[1]);
                                  rotate_vec_forward(p, 2, rotate[2]);
                                  // Translate
                                  p = p + translate;
                             };
                             
                             // Lambda to transform normal
                             auto transform_n = [&](vec3& n) {
                                  // Inverse Scale (approximate non-uniform scale for normals)
                                  n.v[0] /= scale.v[0]; n.v[1] /= scale.v[1]; n.v[2] /= scale.v[2];
                                  // Rotate (normal rotates same as vector)
                                  rotate_vec_forward(n, 0, rotate[0]);
                                  rotate_vec_forward(n, 1, rotate[1]);
                                  rotate_vec_forward(n, 2, rotate[2]);
                                  n = unit_vector(n);
                             };

                             transform_p(tri->v0);
                             transform_p(tri->v1);
                             transform_p(tri->v2);
                             
                             if (tri->has_normals) {
                                 transform_n(tri->n0);
                                 transform_n(tri->n1);
                                 transform_n(tri->n2);
                             } else {
                                 // Recompute geometric normal
                                 vec3 e1 = tri->v1 - tri->v0;
                                 vec3 e2 = tri->v2 - tri->v0;
                                 vec3 n = unit_vector(cross(e1, e2));
                                 tri->n0 = n; tri->n1 = n; tri->n2 = n;
                                 tri->has_normals = true;
                             }
                             
                             // world.add(tri);
                         }
                     }
                     world.add(std::make_shared<Mesh>(mesh_triangles));
                 }
             }
        }
    }

    return true;
}
