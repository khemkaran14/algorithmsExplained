def inspect(value,bit):
    mask=1<<bit
    is_set=bool(value&mask)
    set_value,cleared,toggled=value|mask,value&~mask,value^mask
    popcount=value.bit_count()
    return {'isSet':is_set,'set':set_value,'cleared':cleared,'toggled':toggled,'popcount':popcount}
