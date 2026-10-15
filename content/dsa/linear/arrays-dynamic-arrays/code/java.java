class DynamicArray {
 private int[] data=new int[1];private int size=0;
 void append(int value){if(size==data.length)data=java.util.Arrays.copyOf(data,data.length*2);
 data[size++]=value;}
 int[] values(){return java.util.Arrays.copyOf(data,size);}
}
