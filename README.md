This repo implements a handful of isolation algorithms in JavaScript.  Since
JavaScript is single-threaded, interleaving is simulated with generators and
requiring yielding in order to perform a read or a write.

## Goals

* To provide an acceptable approximation of concurrency such that one is
  permitted to reason about the various problems that can occur with the
  presence of interleaving from a familiar language (JS).
* To allow for the composition of concurrency control mechanisms - for example,
  SSI is bootstrappable from SI. It should be possible to implement SSI within
  a context where SI is already guaranteed.
