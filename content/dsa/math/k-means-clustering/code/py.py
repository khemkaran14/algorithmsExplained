def kmeans(points,centers,iterations):
    centers=[c[:] for c in centers];groups=[-1]*len(points)
    for _ in range(iterations):
        next_groups=[min(range(len(centers)),key=lambda c:sum((p[d]-centers[c][d])**2 for d in (0,1))) for p in points]
        unchanged=next_groups==groups;groups=next_groups
        for c in range(len(centers)):
            members=[p for i,p in enumerate(points) if groups[i]==c]
            if members:centers[c]=[sum(p[d] for p in members)/len(members) for d in (0,1)]
        if unchanged:break
    return centers,groups
