#ifndef MATRIX_H
#define MATRIX_H

#include "vec3.h"
#include <cmath>
#include <algorithm>

class Matrix4 {
public:
    double m[4][4];

    Matrix4() {
        for(int i=0; i<4; i++)
            for(int j=0; j<4; j++)
                m[i][j] = (i==j) ? 1.0 : 0.0;
    }

    void set(int r, int c, double val) { m[r][c] = val; }
    double get(int r, int c) const { return m[r][c]; }

    static Matrix4 identity() {
        return Matrix4();
    }

    static Matrix4 translate(double x, double y, double z) {
        Matrix4 mat; // Identity
        mat.m[0][3] = x;
        mat.m[1][3] = y;
        mat.m[2][3] = z;
        return mat;
    }

    static Matrix4 scale(double x, double y, double z) {
        Matrix4 mat; // Identity
        mat.m[0][0] = x;
        mat.m[1][1] = y;
        mat.m[2][2] = z;
        return mat;
    }

    static Matrix4 rotateX(double theta_deg) {
        Matrix4 mat;
        double rad = theta_deg * 3.14159265359 / 180.0;
        double c = std::cos(rad);
        double s = std::sin(rad);
        mat.m[1][1] = c; mat.m[1][2] = -s;
        mat.m[2][1] = s; mat.m[2][2] = c;
        return mat;
    }

    static Matrix4 rotateY(double theta_deg) {
        Matrix4 mat;
        double rad = theta_deg * 3.14159265359 / 180.0;
        double c = std::cos(rad);
        double s = std::sin(rad);
        mat.m[0][0] = c; mat.m[0][2] = s;
        mat.m[2][0] = -s; mat.m[2][2] = c;
        return mat;
    }

    static Matrix4 rotateZ(double theta_deg) {
        Matrix4 mat;
        double rad = theta_deg * 3.14159265359 / 180.0;
        double c = std::cos(rad);
        double s = std::sin(rad);
        mat.m[0][0] = c; mat.m[0][1] = -s;
        mat.m[1][0] = s; mat.m[1][1] = c;
        return mat;
    }

    Matrix4 transpose() const {
        Matrix4 res;
        for(int i=0; i<4; i++)
            for(int j=0; j<4; j++)
                res.m[i][j] = m[j][i];
        return res;
    }
    
    // Matrix multiplication
    Matrix4 operator*(const Matrix4& rhs) const {
        Matrix4 res;
        // Initialize to 0 first! Constructor enables identity.
        // So we must overwrite.
        for(int i=0; i<4; i++) {
            for(int j=0; j<4; j++) {
                res.m[i][j] = 0;
                for(int k=0; k<4; k++)
                    res.m[i][j] += m[i][k] * rhs.m[k][j];
            }
        }
        return res;
    }

    // Transform point (assumes w=1)
    vec3 transform_point(const vec3& p) const {
        double x = p[0]*m[0][0] + p[1]*m[0][1] + p[2]*m[0][2] + m[0][3];
        double y = p[0]*m[1][0] + p[1]*m[1][1] + p[2]*m[1][2] + m[1][3];
        double z = p[0]*m[2][0] + p[1]*m[2][1] + p[2]*m[2][2] + m[2][3];
        // assuming rigid + affine, w=1
        return vec3(x, y, z);
    }

    // Transform vector (assumes w=0) -> For directions (like ray direction, tangents)
    vec3 transform_vector(const vec3& v) const {
        double x = v[0]*m[0][0] + v[1]*m[0][1] + v[2]*m[0][2];
        double y = v[0]*m[1][0] + v[1]*m[1][1] + v[2]*m[1][2];
        double z = v[0]*m[2][0] + v[1]*m[2][1] + v[2]*m[2][2];
        return vec3(x, y, z);
    }
};

#endif
