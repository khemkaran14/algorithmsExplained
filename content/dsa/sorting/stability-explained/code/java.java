class StableSort {
 record Item(int key,int original){}
 static Item[] sort(int[] keys){Item[] a=new Item[keys.length];for(int i=0;i<a.length;i++)a[i]=new Item(keys[i],i);
 for(int i=1;i<a.length;i++){Item key=a[i];int j=i-1;
 while(j>=0&&a[j].key()>key.key()){a[j+1]=a[j];j--;}a[j+1]=key;}
 return a;}}
