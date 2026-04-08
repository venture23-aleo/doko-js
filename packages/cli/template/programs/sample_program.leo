// The 'sample_program' program.
program sample_program.aleo {
    @noupgrade
    async constructor(){}

    fn main(public a: u32, b: u32) -> u32 {
        let c: u32 = a + b;
        return c;
    }
}