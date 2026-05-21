import { trpc } from "~/trpc/client"

export const useSignUp = () => {

  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status

  } = trpc.auth.createUserWithEmailAndPassword.useMutation()

  return{
    createUserWithEmailAndPassword,
    createUserWithEmailAndPasswordAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status
  }
}

export const useSignIn = () => {

  const {
    mutateAsync: signinUserWithEmailAndPasswordAsync,
    mutate: signinUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status

  } = trpc.auth.signinUserWithEmailAndPassword.useMutation()

  return{
    signinUserWithEmailAndPassword,
    signinUserWithEmailAndPasswordAsync,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status
  }
}