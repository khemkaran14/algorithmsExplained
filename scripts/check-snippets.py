"""Syntax-check authored code assets without writing generated files to content/."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import ast, shutil, subprocess, sys, tempfile, os
root=Path(__file__).resolve().parents[1]
compiler=os.environ.get('JAVAC') or shutil.which('javac')
java=[compiler] if compiler else [shutil.which('java') or '/usr/lib/jvm/default-java/bin/java','com.sun.tools.javac.Main']
required=['node',java[0],'g++']
missing=[tool for tool in required if not shutil.which(tool)]
if missing:
    print('Missing required code-check tools: '+', '.join(missing),file=sys.stderr)
    sys.exit(1)
def check(directory):
    errors=[]
    try: ast.parse((directory/'py.py').read_text(),filename=str(directory/'py.py'))
    except SyntaxError as error: errors.append(str(error))
    with tempfile.TemporaryDirectory(prefix='algoverse-code-') as output:
        for command in [['node','--check',str(directory/'js.ts')],[*java,'-d',output,str(directory/'java.java')],['g++','-std=c++17','-fsyntax-only',str(directory/'cpp.cpp')]]:
            result=subprocess.run(command,capture_output=True,text=True)
            if result.returncode: errors.append(result.stderr)
    return directory.parent.relative_to(root),errors
paths=[p for p in (root/'content').rglob('code') if (p.parent/'lesson.mdx').exists()]
failed=0
with ThreadPoolExecutor(max_workers=2) as pool:
    for name,errors in pool.map(check,sorted(paths)):
        if errors:
            failed+=1
            print('FAIL '+str(name),file=sys.stderr)
            for error in errors: print(error,file=sys.stderr)
        else: print('PASS '+str(name))
print(f'Checked four-language snippets for {len(paths)} lessons; {failed} failed.')
sys.exit(1 if failed else 0)
