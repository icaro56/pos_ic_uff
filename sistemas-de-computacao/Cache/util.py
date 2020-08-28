
def formatCacheToPrint(mCache):
    text = ""
    for idx, val in enumerate(mCache):
        if (idx < len(mCache)-1):
            text += str(val.address) + " | "
        else:
            text += str(val.address)

    return text
