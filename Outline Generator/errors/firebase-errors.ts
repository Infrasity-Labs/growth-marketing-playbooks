class FireBaseError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}

class EMAIL_EXISTS extends FireBaseError {
  constructor(message: string) {
    super(message, "EMAIL_EXISTS");
  }
}

class INVALID_CRED extends FireBaseError {
  constructor(message: string) {
    super(message, "INVALID_CREDENTIALS")
  }
}

class INTERNAL_ERROR extends FireBaseError {
  constructor(message: string) {
    super(message, "INTERNAL_ERROR");
  }
}

class CREDENTIAL_ALREADY_IN_USE extends FireBaseError {
  constructor(message: string) {
    super(message, "CREDENTIAL_ALREADY_IN_USE");
  }
}

class INVALID_PASSWORD extends FireBaseError {
  constructor(message: string) {
    super(message, "INVALID_PASSWORD");
  }
}

class NO_AUTH_EVENT extends FireBaseError {
  constructor(message: string) {
    super(message, "NO_AUTH_EVENT");
  }
}

class OPERATION_NOT_ALLOWED extends FireBaseError {
  constructor(message: string) {
    super(message, "OPERATION_NOT_ALLOWED");
  }
}

class OPERATION_NOT_SUPPORTED extends FireBaseError {
  constructor(message: string) {
    super(message, "OPERATION_NOT_SUPPORTED");
  }
}

class USER_DELETED extends FireBaseError {
  constructor(message: string) {
    super(message, "USER_DELETED");
  }
}

class REJECTED_CREDENTIAL extends FireBaseError {
  constructor(message: string) {
    super(message, "REJECTED_CREDENTIAL");
  }
}

class POPUP_CLOSED_BY_USER extends FireBaseError {
  constructor(message: string) {
    super(message, "POPUP_CLOSED_BY_USER");
  }
}

class EXPIRED_POPUP_REQUEST extends FireBaseError {
  constructor(message: string) {
    super(message, "EXPIRED_POPUP_REQUEST");
  }
}

class POPUP_BLOCKED extends FireBaseError {
  constructor(message: string) {
    super(message, "POPUP_BLOCKED");
  }
}

export const FireBaseErrors = {
  EMAIL_EXISTS,
  INTERNAL_ERROR,
  CREDENTIAL_ALREADY_IN_USE,
  INVALID_PASSWORD,
  NO_AUTH_EVENT,
  OPERATION_NOT_ALLOWED,
  OPERATION_NOT_SUPPORTED,
  USER_DELETED,
  REJECTED_CREDENTIAL,
  POPUP_CLOSED_BY_USER,
  EXPIRED_POPUP_REQUEST,
  POPUP_BLOCKED,
  INVALID_CRED
};
