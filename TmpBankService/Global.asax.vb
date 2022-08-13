Imports System.Data.Entity
Imports System.Web.Http
Imports System.Web.Optimization
Imports TmpBankService
Public Class Global_asax
    Inherits HttpApplication

    Sub Application_Start(sender As Object, e As EventArgs)
        System.Diagnostics.Debug.WriteLine("initializing service")
        TmpBankService.Service.Init()
    End Sub

End Class