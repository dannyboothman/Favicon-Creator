/**
 * chrome.storage.local writes with lastError handling and quota recovery.
 * History entries with uploaded images can exceed the default 10 MB quota.
 */
(function (global) {
  var HISTORY_KEY = "faviconHistory";
  var HISTORY_BUDGET = 6 * 1024 * 1024;
  var MAX_PRUNE_ATTEMPTS = 30;
  var QUOTA_MESSAGE =
    "Storage is full. Delete old history or remove images and try again.";

  function lastErrorMessage() {
    return (
      (chrome.runtime &&
        chrome.runtime.lastError &&
        chrome.runtime.lastError.message) ||
      ""
    );
  }

  function isQuotaError(message) {
    return /quota/i.test(String(message || ""));
  }

  function userMessage(raw) {
    if (isQuotaError(raw)) {
      return QUOTA_MESSAGE;
    }
    return raw || "Could not save settings.";
  }

  function jsonSize(value) {
    try {
      return JSON.stringify(value).length;
    } catch (err) {
      return 0;
    }
  }

  function fitHistory(history) {
    var next = Array.isArray(history) ? history.slice() : [];
    while (next.length > 1 && jsonSize(next) > HISTORY_BUDGET) {
      next.pop();
    }
    return next;
  }

  function trySet(payload) {
    return new Promise(function (resolve, reject) {
      chrome.storage.local.set(payload, function () {
        var msg = lastErrorMessage();
        if (msg) {
          var err = new Error(userMessage(msg));
          err.quota = isQuotaError(msg);
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  function getHistory() {
    return new Promise(function (resolve) {
      chrome.storage.local.get([HISTORY_KEY], function (stored) {
        resolve(Array.isArray(stored[HISTORY_KEY]) ? stored[HISTORY_KEY] : []);
      });
    });
  }

  function pruneOldestHistoryEntry() {
    return getHistory().then(function (history) {
      if (history.length === 0) {
        return false;
      }
      history.pop();
      return trySet({ faviconHistory: history }).then(
        function () {
          return true;
        },
        function () {
          return false;
        }
      );
    });
  }

  function recoverQuotaAndRetry(payload, attemptsLeft) {
    if (attemptsLeft <= 0) {
      return Promise.reject(new Error(QUOTA_MESSAGE));
    }

    if (payload[HISTORY_KEY] && payload[HISTORY_KEY].length > 1) {
      var trimmed = payload[HISTORY_KEY].slice();
      trimmed.pop();
      var nextPayload = {};
      Object.keys(payload).forEach(function (key) {
        nextPayload[key] = payload[key];
      });
      nextPayload[HISTORY_KEY] = trimmed;
      return trySet(nextPayload).catch(function (err) {
        if (err && err.quota) {
          return recoverQuotaAndRetry(nextPayload, attemptsLeft - 1);
        }
        throw err;
      });
    }

    return pruneOldestHistoryEntry().then(function (pruned) {
      if (!pruned) {
        return Promise.reject(new Error(QUOTA_MESSAGE));
      }
      return trySet(payload).catch(function (err) {
        if (err && err.quota) {
          return recoverQuotaAndRetry(payload, attemptsLeft - 1);
        }
        throw err;
      });
    });
  }

  function setLocal(payload) {
    return trySet(payload).catch(function (err) {
      if (err && err.quota) {
        return recoverQuotaAndRetry(payload, MAX_PRUNE_ATTEMPTS);
      }
      throw err;
    });
  }

  global.FaviconStorage = Object.freeze({
    HISTORY_KEY: HISTORY_KEY,
    HISTORY_BUDGET: HISTORY_BUDGET,
    set: setLocal,
    fitHistory: fitHistory,
  });
})(typeof window !== "undefined" ? window : self);
