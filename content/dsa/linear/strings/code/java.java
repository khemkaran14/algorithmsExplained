class CodePoints {
 static int[] codePoints(String text){
 // codePoints() combines valid UTF-16 surrogate pairs.
 // It does not perform grapheme segmentation.
 int[] points=text.codePoints().toArray();
 return points;}}
