interface someActionParams {
  someParam: string
}

export const action = ({ someParam }: someActionParams) => ({
  someParam,
})
