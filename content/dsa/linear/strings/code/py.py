def code_points(text):
    out=[]
    for point in text:
        # Python str iteration exposes Unicode code points, not grapheme clusters.
        out.append(ord(point))
    return out
