function(builtCommit=null) (
  {
    status: {
      [if builtCommit == null then null else 'builtCommit']: builtCommit,
      conditions: [
        {
          type: 'Synced',
          status: if builtCommit == null then 'False' else 'True',
        },
      ],
    },
  }
)
