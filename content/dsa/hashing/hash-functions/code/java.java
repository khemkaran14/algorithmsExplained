class Hash {static int hash(String text,int m){int h=0;
for(int i=0;i<text.length();i++){
h=(31*h+text.charAt(i))%m;
}
// This teaching routine accepts printable ASCII keys.
return h;}}
