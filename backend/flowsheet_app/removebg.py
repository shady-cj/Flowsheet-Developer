from withoutbg import WithoutBG

MODEL = WithoutBG.opensource()  # runs ONCE

def remove_bg(path):
    return MODEL.remove_background(path)