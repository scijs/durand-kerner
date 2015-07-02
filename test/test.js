var roots = require("../roots.js")
var mult = require("poly-mult")
var almostEqual = require("almost-equal")

var TOL = 1e-3

function hasRoot(a, b, zr, zi) {
  for(var i=0; i<zr.length; ++i) {
    if(almostEqual(zr[i], a, TOL, TOL) &&
       almostEqual(zi[i], b, TOL, TOL)) {
      return true
    }
  }
  return false
}

require("tape")("durand-kerner", function(t) {
  
  function runTest(pr, pi, zr, zi) {
    var res = roots(pr, pi)
    for(var i=0; i<res[0].length; ++i) {
      t.assert(hasRoot(res[0][i], res[1][i], zr, zi), "Root: " + res[0][i] +"+"+ res[1][i]+"i")
    }
  }
  
  runTest([-5, 3, -3, 1], [0,0,0,0], [2.5874, 0.2063, 0.2063], [0, 1.3747, -1.3747])
  
  //Check linear
  for(var i=1; i<10; ++i) {
    runTest([1, -i], [0, 0], [1.0/i], [0])
  }
  
  //Check quadrics
  for(var i=1; i<10; ++i) {
    runTest([i, 0, -1], [0, 0, 0], [Math.sqrt(i), -Math.sqrt(i)], [0, 0])
    runTest([1, 0, -i], [0, 0, 0], [1./Math.sqrt(i), -1./Math.sqrt(i)], [0, 0])
  }
  
  //Check product
  for(var i=0; i<10; ++i) {
    for(var j=0; j<10; ++j) {
      for(var k=0; k<10; ++k) {
        runTest(mult([i, -1], mult([j, -1], [k, -1])), [0, 0, 0, 0], [i, j, k], [0, 0, 0])
      }
    }
  }
  
  t.end()
})