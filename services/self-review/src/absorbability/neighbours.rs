use crate::domain::values::DepartmentId;

pub struct DivisionNeighbourResolver;

impl DivisionNeighbourResolver {
    pub fn get_division_neighbours(
        department_id: &DepartmentId,
        all_departments_in_division: &[DepartmentId],
    ) -> Vec<DepartmentId> {
        all_departments_in_division
            .iter()
            .filter(|d| *d != department_id)
            .cloned()
            .collect()
    }
}
