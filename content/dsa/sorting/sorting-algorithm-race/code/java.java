import java.util.*;
import java.util.function.UnaryOperator;
class Race {
 static Map<String,int[]> compare(int[] input,Map<String,UnaryOperator<int[]>> algorithms){var out=new LinkedHashMap<String,int[]>();
 for(var entry:algorithms.entrySet())out.put(entry.getKey(),entry.getValue().apply(input.clone()));
 return out;}}
