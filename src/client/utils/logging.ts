/**
 * This function is used to log all errors which occur in the
 * Unify Intent Client. We don't log any messages in the console
 * beyond `debug` so as to not pollute users' dev consoles.
 *
 * @param message - the error message to log
 */
export function logUnifyError({ message }: { message: string }) {
  console.debug(`%c[Unify]: %c${message}`, 'font-weight: bold;', '');
}
