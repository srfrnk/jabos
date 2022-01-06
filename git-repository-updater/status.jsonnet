function(latestCommit=null) (
  {
    status: {
      [if latestCommit == null then null else 'latestCommit']: latestCommit,
      conditions: [
        {
          type: 'Syncing',
          status: if latestCommit == null then 'False' else 'True',
        },
      ],
    },
  }
)
