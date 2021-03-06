import React, {useEffect, useState} from "react"
import useLocalStorage from "utils/useLocalStorage"
import * as R from "ramda"
import TextField from "@material-ui/core/TextField"
import Grid from "@material-ui/core/Grid"
import {charTable} from "constants/charTable"
import makeStyles from "@material-ui/core/styles/makeStyles"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Checkbox from "@material-ui/core/Checkbox"
import Typography from "@material-ui/core/Typography"
import Paper from "@material-ui/core/Paper"
import Card from "@material-ui/core/Card"
import CardActionArea from "@material-ui/core/CardActionArea"
import CardContent from "@material-ui/core/CardContent"
import Alert from "@material-ui/lab/Alert"
import Snackbar from "@material-ui/core/Snackbar"

const useStyles = makeStyles({
    paperContent: {
        margin: 15,
        padding: 15,
        maxWidth: 800,
        backgroundColor: "#ECEFF1"
    },
    typographyOutput: {
        whiteSpace: "pre"
    },
    cardOutput: {
        backgroundColor: "#CFD8DC"
    }
})

export default function Application() {
    const classes = useStyles()

    const [withBorder, setWithBorder] = useLocalStorage("withBorder", true)
    const [innerChar, setInnerChar] = useLocalStorage("innerChar", "🟥")
    const [outerChar, setOuterChar] = useLocalStorage("outerChar", "🤍")
    const [inputText, setInputText] = useLocalStorage("inputText", "HELLO")

    const [outputText, setOutputText] = useState("")
    const [alertSettings, setAlertSettings] = useState({isVisible: false})

    const handleCheckboxChangeWithBorder = event => setWithBorder(event.target.checked)
    const handleTextFieldChangeInner = event => setInnerChar(event.target.value)
    const handleTextFieldChangeOuter = event => setOuterChar(event.target.value)
    const handleTextFieldChangeInput = event => setInputText(event.target.value)

    const handleSnackbarCloseAlert = (event, reason) => {
        if (reason !== "clickaway") {
            setAlertSettings({isVisible: false})
        }
    }


    const handleCardClickOutput = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(outputText)
                .then(() => {
                    setAlertSettings({isVisible: true, type: "success", text: "Copied!"})
                }, error => {
                    setAlertSettings({isVisible: true, type: "error", text: "navigator.clipboard.writeText(outputText) call failed: " + error})
                })
        } else {
            const textArea = document.createElement("textarea")
            textArea.value = outputText

            textArea.style.top = "0"
            textArea.style.left = "0"
            textArea.style.position = "fixed"

            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()

            try {
                document.execCommand("copy")
                    ? setAlertSettings({isVisible: true, type: "success", text: "Copied!"})
                    : setAlertSettings({isVisible: true, type: "error", text: "document.execCommand(\"copy\") call failed"})
            } catch (error) {
                setAlertSettings({isVisible: true, type: "error", text: "document.execCommand(\"copy\") call failed: " + error})
            } finally {
                document.body.removeChild(textArea)
            }
        }
    }

    useEffect(() => {
        const charArrays = inputText
            .toLowerCase()
            .split("")
            .map(char => charTable[char])
            .filter(charArray => charArray !== undefined) // ignore unknown chars

        const rows = R.transpose(charArrays).map(R.pipe(R.intersperse([0]), R.flatten))

        const newOutputText = (
            withBorder ? (() => {
                const sideBorderedRows = rows.map(row => Array.of(0).concat(row).concat(0))
                const additionalRow = Array.of(Array.from(Array(sideBorderedRows[0]?.length || 0), () => 0))
                return additionalRow.concat(sideBorderedRows).concat(additionalRow)
            })() : (() => {
                return rows
            })()
        ).map(R.pipe(R.map(flag => flag ? innerChar : outerChar), R.join(""))).join("\n")

        setOutputText(newOutputText)
    }, [withBorder, innerChar, outerChar, inputText])

    return (
        <Paper className={classes.paperContent} square>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Card className={classes.cardOutput}>
                        <CardActionArea onClick={handleCardClickOutput}>
                            <CardContent>
                                <Typography
                                    className={classes.typographyOutput}
                                    noWrap={true}
                                    align={"center"}
                                >
                                    {outputText}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    <Snackbar
                        open={alertSettings.isVisible}
                        onClose={handleSnackbarCloseAlert}
                        autoHideDuration={2000}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    >
                        <Alert
                            variant="filled"
                            severity={alertSettings.type}
                        >
                            {alertSettings.text}
                        </Alert>
                    </Snackbar>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={8}>
                            <TextField
                                label="input"
                                fullWidth
                                value={inputText}
                                onChange={handleTextFieldChangeInput}
                            />
                            <FormControlLabel
                                label="use border"
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={withBorder}
                                        onChange={handleCheckboxChangeWithBorder}
                                    />
                                }
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                label="inner"
                                fullWidth
                                value={innerChar}
                                onChange={handleTextFieldChangeInner}
                            />
                            <TextField
                                label="outer"
                                fullWidth
                                value={outerChar}
                                onChange={handleTextFieldChangeOuter}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    )
}
