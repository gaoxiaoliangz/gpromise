// @ts-check
const STATE = {
  pending: "pending",
  fullfilled: "fullfilled",
  rejected: "rejected",
};

class Promise {
  constructor(executor) {
    this._state = STATE.pending;
    this._cbs = [];
    this._value = undefined;
    this._resolveOrRejectCalled = false;
    this.then = this.then.bind(this);
    this.catch = this.catch.bind(this);
    executor(this._resolve.bind(this), this._reject.bind(this));
  }

  static resolve(v) {
    return new Promise((resolve) => {
      resolve(v);
    });
  }

  static reject(v) {
    return new Promise((_, reject) => {
      reject(v);
    });
  }

  _cb() {
    setTimeout(() => {
      if (this._state !== STATE.pending) {
        const cbs = this._cbs;
        this._cbs = [];
        cbs.forEach((cb) => cb());
        if (this._cbs.length) {
          this._cb();
        }
      }
    }, 0);
  }

  _settleState(state, value) {
    if (this._state === STATE.pending) {
      this._state = state;
      this._value = value;
      this._cb();
    }
  }

  _resolve(v) {
    if (this._resolveOrRejectCalled) {
      return;
    }
    this._resolveOrRejectCalled = true;

    const resolveThenable = (maybeThenable) => {
      try {
        const then =
          maybeThenable &&
          (typeof maybeThenable === "object" ||
            typeof maybeThenable === "function") &&
          maybeThenable.then;

        if (typeof then === "function") {
          let currentCalled = false;
          try {
            then.call(
              maybeThenable,
              (v) => {
                if (currentCalled) {
                  return;
                }
                currentCalled = true;
                resolveThenable(v);
              },
              (e) => {
                if (currentCalled) {
                  return;
                }
                this._settleState(STATE.rejected, e);
              }
            );
          } catch (error) {
            if (!currentCalled) {
              this._settleState(STATE.rejected, error);
            }
          }
          return;
        }

        // not thenable
        this._settleState(STATE.fullfilled, maybeThenable);
      } catch (error) {
        this._settleState(STATE.rejected, error);
      }
    };

    resolveThenable(v);
  }

  _reject(e) {
    if (this._resolveOrRejectCalled) {
      return;
    }
    this._resolveOrRejectCalled = true;
    this._settleState(STATE.rejected, e);
  }

  then(onFullfilled, onRejected) {
    const promise = new Promise((resolve, reject) => {
      this._cbs.push(() => {
        let cb = (v) => v;

        if (this._state === STATE.fullfilled) {
          if (typeof onFullfilled === "function") {
            cb = onFullfilled;
          }
        } else {
          if (typeof onRejected === "function") {
            cb = onRejected;
          } else {
            cb = null;
          }
        }

        if (cb) {
          try {
            const result = cb(this._value);
            if (result === promise) {
              return reject(
                new TypeError(
                  "Cannot use current promise as callback return value"
                )
              );
            }
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(this._value);
        }
      });

      this._cb();
    });

    return promise;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }
}

module.exports = Promise;
