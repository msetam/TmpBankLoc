Imports System.Data.Entity
Imports System.Web.Http
Imports System.Web.Optimization
Imports TmpBankService
Public Class Global_asax
    Inherits HttpApplication

    Sub Application_Start(sender As Object, e As EventArgs)

        TmpBankService.Service.Init()

        ' Fires when the application is started
        BundleConfig.RegisterBundles(BundleTable.Bundles)
        '        Dim roleActions As New RoleActions()
        '        roleActions.AddUserAndRole()
        Logic.RouterActions.AddCustomRoutes(RouteTable.Routes)
        WebApiConfig.Register(GlobalConfiguration.Configuration)
        GlobalConfiguration.Configuration.EnsureInitialized()
    End Sub

    'Sub Application_Error(sender As Object, e As EventArgs)
    '    Dim exception As Exception = Server.GetLastError()
    '    If TypeOf exception Is HttpUnhandledException Then
    '        Dim errorCode = CType(exception, HttpUnhandledException).GetHttpCode()
    '        Dim errorDescription = CType(exception, HttpUnhandledException).Message
    '        Server.ClearError()
    '        If Logic.RouterActions.HandlesError(errorCode) Then
    '            Response.RedirectToRoute($"Errors{errorCode}", Nothing)
    '            Return
    '        End If
    '        Response.RedirectToRoute("Errors", New With {.ErrorCode = errorCode,
    '                                         .Description = errorDescription})
    '    End If
    'End Sub

End Class