def queens(n):
    out=[]; path=[]
    def search():
        row=len(path)
        if row==n: out.append(path[:]); return
        for col in range(n):
            if any(c==col or abs(c-col)==row-r for r,c in enumerate(path)): continue
            path.append(col); search(); path.pop()
    search(); return out
def subsets(values):
    out=[]; path=[]
    def search(i):
        if i==len(values): out.append(path[:]); return
        search(i+1); path.append(values[i]); search(i+1); path.pop()
    search(0); return out
def permutations(values):
    out=[]; path=[]; used=[False]*len(values)
    def search():
        if len(path)==len(values): out.append(path[:]); return
        for i in range(len(values)):
            if used[i]: continue
            used[i]=True; path.append(values[i]); search(); path.pop(); used[i]=False
    search(); return out
def sudoku(givens,budget=3000):
    board=[row[:] for row in givens]; visits=0; exhausted=False
    def legal(r,c,v):
        return all(board[r][i]!=v and board[i][c]!=v for i in range(9)) and all(board[a][b]!=v for a in range(r//3*3,r//3*3+3) for b in range(c//3*3,c//3*3+3))
    def search():
        nonlocal visits,exhausted
        visits+=1
        if visits>budget: exhausted=True; return False
        choice=None
        for r in range(9):
            for c in range(9):
                if board[r][c]: continue
                options=[v for v in range(1,10) if legal(r,c,v)]
                if not options: return False
                if choice is None or len(options)<len(choice[2]): choice=(r,c,options)
        if choice is None: return True
        r,c,options=choice
        for v in options:
            board[r][c]=v
            if search(): return True
            board[r][c]=0
            if exhausted: return False
        return False
    solved=search(); return board if solved else None,exhausted
