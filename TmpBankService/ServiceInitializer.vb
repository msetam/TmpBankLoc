Imports System.Data.Entity

Namespace Service

    Public Module Initializer
        Public Sub Init()
            Database.SetInitializer(New TmpBankService.Models.UserDatabaseInitializer())
        End Sub
    End Module

End Namespace
