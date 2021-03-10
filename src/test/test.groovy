Closure something() {
    def name = 5
    return { name }
}


int wrapper(Closure something) {
    return 1
}


void func (arg1, arg2) {
    something()
}


def foobar() {
    test2.fizz()
    return null
}

@groovy.transform.Field def MYVAR = "\\foobar's\\ \"string\"";

// This is a comment line .&func
foobar()

if (3 % 2 == 1) {
    // Another inline comment
    something()
    def v = "foobar() MYVAR"
    MYVAR = 2.5
    wrapper(this.&something)
}
