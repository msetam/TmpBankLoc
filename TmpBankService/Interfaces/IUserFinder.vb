Namespace Interfaces
    Public Interface IUserFinder
        Function FindUser(partialName As String) As Models.SearchResult

        Function SayHi() As String
    End Interface

End Namespace