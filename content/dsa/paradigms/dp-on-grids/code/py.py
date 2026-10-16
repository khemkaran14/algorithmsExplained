def grid(cells,minimum=False):
    rows,cols=len(cells),len(cells[0]); dp=[[float('inf') if minimum else 0 for _ in range(cols)] for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if cells[r][c] is None: continue
            if r==c==0: dp[r][c]=cells[r][c] if minimum else 1; continue
            above=dp[r-1][c] if r else float('inf') if minimum else 0
            left=dp[r][c-1] if c else float('inf') if minimum else 0
            dp[r][c]=min(above,left)+cells[r][c] if minimum else above+left
    return None if dp[-1][-1]==float('inf') else dp[-1][-1]
