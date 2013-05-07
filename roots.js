"use strict"

var EPSILON = 1e-8

var bits = require("bit-twiddle")

var pr = new Float64Array(1024)
var pi = new Float64Array(1024)


function solve(n, n_iters, tolerance, z) {
  var m = z.length
  var i, j, k, a, b, na, nb, pa, pb, qa, qb, k1, k2, k3, s1, s2, t, d
  var max = Math.max, abs = Math.abs
  for(i=0; i<n_iters; ++i) {
    d = 0.0
    for(j=0; j<m; ++j) {
      //Read in zj
      pa = z[j][0]
      pb = z[j][1]
      
      //Compute denominator
      //
      //  (zj - z0) * (zj - z1) * ... * (zj - z_{n-1})
      //
      a = 1.0
      b = 0.0
      for(k=0; k<m; ++k) {
        if(k === j) {
          continue
        }
        qa = pa - z[k][0]
        qb = pb - z[k][1]
        if(abs(qa) < EPSILON || abs(qb) < EPSILON) {
          continue
        }
        k1 = qa * (a + b)
        k2 = a * (qb - qa)
        k3 = b * (qa + qb)
        a = k1 - k3
        b = k1 + k2
      }
      
      //Compute numerator
      na = pr[n-1]
      nb = pi[n-1]
      s1 = pb - pa
      s2 = pa + pb
      for(k=n-2; k>=0; --k) {
        k1 = pa * (na + nb)
        k2 = na * s1
        k3 = nb * s2
        na = k1 - k3 + pr[k]
        nb = k1 + k2 + pi[k]
      }
      
      //Compute reciprocal
      k1 = a*a + b*b
      if(abs(k1) > EPSILON) {
        a /=  k1
        b /= -k1
      } else {
        a = 1.0
        b = 0.0
      }
      
      //Multiply and accumulate
      k1 = na * (a + b)
      k2 = a * (nb - na)
      k3 = b * (na + nb)
      
      qa = k1 - k3
      qb = k1 + k2
      
      z[j][0] = pa - qa
      z[j][1] = pb - qb
      
      d = max(d, max(abs(qa), abs(qb)))
    }
    
    //If converged, exit early
    if(d < tolerance) {
      break
    }
  }
  return z
}

function findRoots(r_coeff, i_coeff, n_iters, tolerance, z) {
  var n = r_coeff.length, i
  if(n <= 1) {
    return []
  }
  if(pr.length < n) {
    var nl = bits.nextPow2(n)
    pr = new Float64Array(nl)
    pi = new Float64Array(nl)
  }
  for(i=0; i<n; ++i) {
    pr[i] = r_coeff[i]
  }
  if(!i_coeff) {
    for(i=0; i<n; ++i) {
      pi[i] = 0.0
    }
  } else {
    pi[i] = i_coeff[i]
  }
  
  //Rescale coefficients
  var a = pr[n-1], b = pi[n-1]
  var d = a*a + b*b
  a /= d
  b /= -d
  var k1, k2, k3, s = b - a, t = a + b
  for(var i=0; i<n-1; ++i) {
    k1 = a * (pr[i] + pi[i])
    k2 = pr[i] * s
    k3 = pi[i] * t
    pr[i] = k1 - k3
    pi[i] = k1 + k2
  }
  
  if(!n_iters) {
    n_iters = n * n * n
  }
  if(!tolerance) {
    tolerance = 1e-6
  }
  //Pick default initial guess if unspecified
  if(!z) {
    z = new Array(n-1)
    var a = 1.0, b = 0.0, k1, k2, k3
    for(i=0; i<n-1; ++i) {
      z[i] = [a, b]
      k1 = 0.4 * (a + b)
      k2 = a * 0.5
      k3 = b * 1.3
      a = k1 - k3
      b = k1 + k2
    }
  }
  return solve(n, n_iters, tolerance, z)
}

module.exports = findRoots