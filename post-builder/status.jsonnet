function(label, commit) (
  {
    status: {
      [label]: commit,
      conditions: [
        {
          type: 'Synced',
          status: 'True',
        },
      ],
    },
  }
)
