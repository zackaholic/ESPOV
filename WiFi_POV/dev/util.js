const util = (function() {
  module = {};

}
})();

/*

 function correctGamma(val, max) {
 var gamma = 1.5;
 return max * Math.pow((val / max), 1 / gamma);
       
 function padHex(num) {
   var paddedNum = num.toString(16);
   if (paddedNum.length == 1) {
     return '0' + paddedNum;
   }
   return paddedNum;
 }

 function color8to24bit(color) {
   var red = color & 0b11100000 << 21;
   var green = color & 0b00011100 << 13;
   var blue = color & 0b00000011 << 6;
   var color24 = red | green | blue;
   return color24;
 }

 function color24To8Bit(color) {
  if (color) {
    var color = parseInt(color.replace(/^#/, ''), 16);        
    var red = color >> 21;
    var green = color >> 13 & 0x07;
    var blue = color >> 6 & 0x03;
    var color8 = (red << 5) | (green << 2) | blue;
    return color8;
  }
 }

  var pixelsToString = function() {
   var pixelString = '';
   for (var i = 0; i < imgWidth * canvasRows; i++) {
     pixelString += buffer[i];
     pixelString += ',';
   }
   return pixelString;
 }
         