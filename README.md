## Goals

* To provide an acceptable approximation of concurrency such that a student is
  permitted to reason about the various problems that can occur with the
  presence of interleaving from a familiar language (JS).
* To allow for the composition of concurrency control mechanisms - for example,
  SSI is bootstrappable from SI. It should be possible to implement SSI within
  a context where SI is already guaranteed (perhaps as implemented by the
  student).
