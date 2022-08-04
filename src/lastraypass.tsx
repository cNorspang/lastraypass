import { ActionPanel, List, Detail, Action, showToast, Toast, Form, getPreferenceValues } from "@raycast/api";
import { execSync } from "child_process";
import { useEffect, useState } from "react";

process.env.PATH = process.env.PATH + ":/opt/homebrew/bin" + ":/usr/bin" + ":/usr/local/bin";

export function withLogin<T>(Component: React.ComponentType<T>) {
    return function LoginProvider(props: T) {
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        useEffect(() => {
            try {
                const stdout = execSync("lpass status");
                const isLoggedIn = !stdout.toString().includes("Not logged in");
                setIsLoggedIn(isLoggedIn);
            } catch (e) {
                //console.error(e);
            } finally {
                setIsLoading(false);
            }
        }, []);

        if (isLoading) {
            return <Detail isLoading/>;
        }

        if (!isLoggedIn && !isLoading) {
            return <Login onLogin={() => setIsLoggedIn(true)} />;
        }

        return <Component {...props} />;
    };
}

function Login(props: { onLogin: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    function handleSubmit(values: { password: string }) {
        try {
            execSync(`echo ${values.password} | LPASS_DISABLE_PINENTRY=1 lpass login --trust ${getPreferenceValues().lastpass_username}`);
            props.onLogin();
        } catch (e) {
            console.error(e);
            showToast({ style: Toast.Style.Failure, title: "Failed logging in with LastPass" });
        }
    }

    

    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Login" onSubmit={handleSubmit} />
                </ActionPanel>
            }>
            <Form.PasswordField id="password" title="Master Password" placeholder="Enter your Lastpass master password" />
        </Form>

    );

}

function PasswordList() {
    const [passwords, setPasswords] = useState<string[]>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const stdout = execSync("lpass ls");
            const passwords = stdout.toString().split("\n");
            setPasswords(passwords);
        } catch (e) {
            console.error(e);
            showToast({ style: Toast.Style.Failure, title: "Failed loading passwords" });
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <List isLoading={isLoading}>
            {passwords?.map((password, index) => (
                <List.Item
                    key={index}
                    title={password}
                    actions={
                        <ActionPanel>
                            <Action.CopyToClipboard content={password} />
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}

export default withLogin(PasswordList);