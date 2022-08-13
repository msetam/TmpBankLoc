Namespace Models

    Public Enum DigSigStatus
        WAITING
        TIMED_OUT
        SUCCEEDED
        FAILED
    End Enum

    Public Class DigitalSigResponse
        Public Property Status() As DigSigStatus
        Public Property RequestCode() As Integer
    End Class

    Public Class RequestCode


        Public ReadOnly Property Code() As Integer
        Public ReadOnly Property TimeOut() As Integer
        Public ReadOnly Property ExpectedResult() As DigSigStatus
        Public ReadOnly Property CreatedDate() As Date = Date.UtcNow()
        Public ReadOnly Property Data As Object

        Public Sub New(code As Integer, data As Object, timeOut As Integer, expectedResult As DigSigStatus)
            Me.Code = code
            Me.Data = data
            Me.TimeOut = timeOut
            Me.ExpectedResult = expectedResult
        End Sub

        Public Function HasTimedOut() As Boolean
            Return Me.CreatedDate.AddMilliseconds(TimeOut) < Date.UtcNow()
        End Function


    End Class


    Public Class DigSigUser
        Public Property RequestCodes() As New List(Of RequestCode)

        Public Function HasRequestCode(requestCode As Integer) As Boolean
            Return Me.RequestCodes.Any(Function(val) val.Code = requestCode)
        End Function

        Public Function GenerateRequestCode(data As Object, timeOut As Integer, expectedResult As DigSigStatus) As Integer
            Dim newRequestCode As Integer = 0
            If RequestCodes.Count > 0 Then
                newRequestCode = RequestCodes(RequestCodes.Count - 1).Code + 1
            End If
            RequestCodes.Add(New RequestCode(newRequestCode, data, timeOut, expectedResult))
            Return newRequestCode
        End Function
    End Class
End Namespace
