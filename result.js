// dont @ me

let ok = v => ({
  andThen: r => r(v),
  catch: r => ok(v),
  unwrap: () => v,
});

let err = v => ({
  andThen: r => err(v),
  catch: r => r(v),
  unwrap: () => {
    throw new Error();
  },
});

module.exports = {ok, err};
