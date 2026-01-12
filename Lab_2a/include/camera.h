#ifndef CAMERA_H
#define CAMERA_H

#include <string>
#include <vector>
#include <cmath>
#include <iostream>
#include <algorithm>
#include <filesystem>

#include "math/vec3.h"
#include "ray.h"
#include "hittable.h"
#include "light.h"
#include "io/image.h"
#include "io/image_saver.h"


constexpr double PI = 3.14159265359;
constexpr double DEG2RAD = PI / 180.0;

class camera {
public:
    point3 position;
    point3 lookat;
    vec3 up;
    double horizontal_fov; // in degree
    int width;
    int height;
    int max_bounces;
    std::string output_file;
    color background_color;

    camera() 
        : position(0,0,0), lookat(0,0,-1), up(0,1,0), 
          horizontal_fov(45), width(512), height(512), max_bounces(5), 
          background_color(0,0,0) {}

    void render(const hittable& world, const std::vector<Light>& lights = {}) {
        initialize();
        
        std::string filename = output_file.empty() ? "output.png" : output_file;
        
        // Resolve output directory
        std::filesystem::path out_dir = "output";
        if (!std::filesystem::exists(out_dir)) {
             if (std::filesystem::exists("../../output")) {
                 out_dir = "../../output";
             } else {
                 try {
                    std::filesystem::create_directories(out_dir);
                 } catch (const std::exception& e) {
                     std::cerr << "Error creating output directory: " << e.what() << std::endl;
                 }
             }
        }
        std::string output_path = (out_dir / filename).string();

        Image img(width, height);

        std::cout << "Rendering " << filename << " (" << width << "x" << height << ")..." << std::endl;

        for (int j = 0; j < height; ++j) {
            std::clog << "\rScanlines remaining: " << (height - j) << ' ' << std::flush;
            for (int i = 0; i < width; ++i) {
              

                double u = (double(i) + 0.5) / double(width);
                double v = (double(height - 1 - j) + 0.5) / double(height); 

                ray r = get_ray(u, v);
                color pixel_color = ray_color(r, world, lights, max_bounces);
                img.set_pixel(i, j, pixel_color);
            }
        }
        std::clog << "\rDone.                 \n";

        if (ImageSaver::save_png(img, output_path)) {
            std::cout << "Saved to " << output_path << std::endl;
        } else {
            std::cerr << "Failed to save image to " << output_path << std::endl;
        }
    }

private:
   point3 origin;
   point3 lower_left_corner;
   vec3 horizontal;
   vec3 vertical;
   vec3 u, v, w; // Camera frame basis vectors

   void initialize() {
       double theta = 2.0 * horizontal_fov * DEG2RAD;
       double h = tan(theta / 2.0);
       double viewport_width = 2.0 * h;
       double aspect_ratio = double(width) / double(height);
       double viewport_height = viewport_width / aspect_ratio;

       w = unit_vector(position - lookat);
       u = unit_vector(cross(up, w));
       v = cross(w, u);

       origin = position;
       horizontal = viewport_width * u;
       vertical = viewport_height * v;
       lower_left_corner = origin - horizontal/2 - vertical/2 - w;
   }

   ray get_ray(double s, double t) const {
       return ray(origin, lower_left_corner + s*horizontal + t*vertical - origin);
   }

   vec3 reflect(const vec3& v, const vec3& n) {
       return v - 2 * dot(v, n) * n;
   }

   vec3 refract(const vec3& uv, const vec3& n, double etai_over_etat) {
       auto cos_theta = std::min(dot(-uv, n), 1.0);
       vec3 r_out_perp =  etai_over_etat * (uv + cos_theta*n);
       vec3 r_out_parallel = -std::sqrt(std::abs(1.0 - dot(r_out_perp, r_out_perp))) * n;
       return r_out_perp + r_out_parallel;
   }

   color ray_color(const ray& r, const hittable& world, const std::vector<Light>& lights, int depth) {
       if (depth <= 0) return color(0,0,0);

       hit_record rec;
       // 0.001 to avoid shadow acne
       if (world.hit(r, 0.001, 1.0e10, rec)) {
           if (!rec.mat_ptr) return color(0,0,0);

           color total_color(0,0,0);
           vec3 view_dir = unit_vector(-r.direction);
           vec3 normal = unit_vector(rec.normal);

           // Resolve object color (texture or diffuse) - Move up for global usage
           color object_color = rec.mat_ptr->diffuse;
           if (rec.mat_ptr->texture && rec.mat_ptr->texture->data) {
                object_color = rec.mat_ptr->texture->value(rec.u, rec.v);
           }

        
           double mixing_factor = 1.0 - (rec.mat_ptr->reflectance + rec.mat_ptr->transmittance);
           if (mixing_factor < 0.0) mixing_factor = 0.0;

           // Ambient
           for (const auto& light : lights) {
               if (light.type == AMBIENT) {
                

                   total_color += mixing_factor * rec.mat_ptr->ka * light.light_color * object_color;
               }
           }

           // Lights
           for (const auto& light : lights) {
               if (light.type == AMBIENT) continue;

               vec3 light_dir;
               double light_distance;
               color intensity = light.light_color;

               if (light.type == POINT || light.type == SPOT) {
                   vec3 diff = light.position - rec.p;
                   light_distance = std::sqrt(dot(diff, diff));
                   light_dir = unit_vector(diff);
               } else { // PARALLEL
                   light_dir = unit_vector(-light.direction);
                   light_distance = 1.0e20; // Infinite
               }

               // Shadows
               ray shadow_ray(rec.p, light_dir);
               hit_record shadow_rec;
               if (world.hit(shadow_ray, 0.001, light_distance, shadow_rec)) {
                   continue;
               }
               
               // Diffuse
               double n_dot_l = std::max(0.0, dot(normal, light_dir));
               
               if (n_dot_l > 0) {
                   total_color += mixing_factor * rec.mat_ptr->kd * n_dot_l * intensity * object_color;

                   // Specular
                   vec3 reflect_dir = reflect(-light_dir, normal);
                   double spec_angle = std::max(0.0, dot(reflect_dir, view_dir));
                   double spec_factor = std::pow(spec_angle, rec.mat_ptr->exponent);
                   
                   total_color += rec.mat_ptr->ks * spec_factor * intensity;
               }
           }
           
           if (rec.mat_ptr->reflectance > 0) {
               vec3 reflected = reflect(unit_vector(r.direction), normal);
               total_color += rec.mat_ptr->reflectance * ray_color(ray(rec.p, reflected), world, lights, depth - 1);
           }
           
           if (rec.mat_ptr->transmittance > 0) {
               double refraction_ratio = rec.front_face ? (1.0 / rec.mat_ptr->iof) : rec.mat_ptr->iof;
               vec3 unit_direction = unit_vector(r.direction);
               
               double cos_theta = std::min(dot(-unit_direction, normal), 1.0);
               double sin_theta = std::sqrt(1.0 - cos_theta*cos_theta);
               
               bool cannot_refract = refraction_ratio * sin_theta > 1.0;
               vec3 direction;

               if (cannot_refract) {
                   direction = reflect(unit_direction, normal);
               } else {
                   direction = refract(unit_direction, normal, refraction_ratio);
               }
               
               total_color += rec.mat_ptr->transmittance * ray_color(ray(rec.p, direction), world, lights, depth - 1);
           }

           
           for (int k=0; k<3; k++) if(total_color[k]>1.0) total_color[k]=1.0;
           return total_color;
       }
       return background_color;
   }
};

#endif
