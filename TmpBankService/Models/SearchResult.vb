Namespace Models

    <Serializable()>
    Public Class SearchHistory
        Public Property Username As String
        Public Property Result As String
    End Class

    <Serializable()>
    Public Class SearchResult
        Public Property History As List(Of SearchHistory)

        Public Property Result As String
    End Class

End Namespace