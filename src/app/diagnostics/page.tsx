export default function DiagnosticsPage() {
    return (
        <div className="p-8 text-white">
            <h1>Diagnostics Page</h1>
            <p>System Timestamp: {new Date().toISOString()}</p>
            <p>If you see this, the deployment is working for new routes.</p>
        </div>
    );
}
