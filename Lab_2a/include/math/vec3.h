#ifndef VEC3_H
#define VEC3_H

#include <cmath>
#include <iostream>

class vec3 {
public:
    double v[3];

    vec3(double v0 = 0, double v1 = 0, double v2 = 0) {
        v[0] = v0; v[1] = v1; v[2] = v2;
    }

    double operator[](int i) const { return v[i]; }
    double& operator[](int i) { return v[i];}


    vec3 operator-() const {
        return vec3(-v[0], -v[1], -v[2]);
    }

    vec3& operator+=(const vec3& other) {
        v[0] += other.v[0];
        v[1] += other.v[1];
        v[2] += other.v[2];
        return *this;
    }

    vec3& operator*=(double scalar) {
        v[0] *= scalar;
        v[1] *= scalar;
        v[2] *= scalar;
        return *this;
    }

    vec3& operator/=(double scalar) {
        return *this *= 1 / scalar;
    }
};




inline vec3 operator+(const vec3& a, const vec3& b) {
    return vec3(a[0] + b[0], a[1] + b[1], a[2] + b[2]);
}
inline vec3 operator-(const vec3& a, const vec3& b) {
    return vec3(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
inline vec3 operator*(const vec3& a, const vec3& b) {
    return vec3(a[0] * b[0], a[1] * b[1], a[2] * b[2]);
}
inline vec3 operator*(double t, const vec3& v) {
    return vec3(t * v[0], t * v[1], t * v[2]);
}
inline vec3 operator*(const vec3& v, double t) {
    return t * v;
}
inline vec3 operator/(const vec3& v, double t) {
    return (1 / t) * v;
}
inline double dot(const vec3& a, const vec3& b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

inline vec3 cross(const vec3& a, const vec3& b) {
    return vec3(
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    );

}

inline vec3 unit_vector(const vec3& v) {
    return v / std::sqrt(dot(v, v));
}

using color = vec3;

using point3 = vec3;



#endif
