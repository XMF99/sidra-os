use sidra_connectors::{route_effect_policy, InvocationVerdict, Operation, Scope, OperationName};
use sidra_domain::EffectClass;
use sidra_security::PermissionBroker;

#[test]
fn test_effect_class_routing_policy() {
    let broker = PermissionBroker::new();

    let op_read = Operation::new(
        OperationName::new("read_op"),
        Scope::parse("integration:github:read").unwrap(),
        EffectClass::Class1_ReversibleLocal,
        "GET",
        "/read",
    ).unwrap();

    let op_write = Operation::new(
        OperationName::new("write_op"),
        Scope::parse("integration:github:write").unwrap(),
        EffectClass::Class2_IrreversibleExternal,
        "POST",
        "/write",
    ).unwrap();

    let op_admin = Operation::new(
        OperationName::new("admin_op"),
        Scope::parse("integration:github:admin").unwrap(),
        EffectClass::Class3_CriticalHumanSignature,
        "DELETE",
        "/admin",
    ).unwrap();

    // Class 1 -> Allowed
    let res_read = route_effect_policy("agent-1", "github", &op_read, &broker).unwrap();
    assert_eq!(res_read, InvocationVerdict::Allowed);

    // Class 2 -> Needs approval by default
    let res_write = route_effect_policy("agent-1", "github", &op_write, &broker).unwrap();
    assert!(matches!(res_write, InvocationVerdict::NeedsApproval(_)));

    // Class 3 -> ALWAYS Needs approval
    let res_admin = route_effect_policy("agent-1", "github", &op_admin, &broker).unwrap();
    assert!(matches!(res_admin, InvocationVerdict::NeedsApproval(_)));
}
